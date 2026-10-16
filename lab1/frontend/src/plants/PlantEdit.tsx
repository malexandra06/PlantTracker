import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList,
  IonLoading, IonPage, IonText, IonTextarea, IonTitle, IonToggle, IonToolbar,
  useIonAlert, useIonRouter,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Plant } from './Plant';
import { usePlants } from './PlantProvider';
import { today } from './watering';

const emptyPlant: Plant = {
  name: '', species: '', location: '', wateringIntervalDays: 7,
  lastWatered: null, isIndoor: true, notes: '',
};

// Used for both routes: /plant (add) and /plant/:id (edit).
const PlantEdit: React.FC<RouteComponentProps<{ id?: string }>> = ({ match }) => {
  const plantId = match.params.id ? Number(match.params.id) : undefined;
  const isNew = plantId === undefined;

  const { plants, loading, loadError, savePlant, deletePlant } = usePlants();
  const existing = plants.find((p) => p.id === plantId);
  const router = useIonRouter();
  const [presentAlert] = useIonAlert();

  const [form, setForm] = useState<Plant>(emptyPlant);
  const [formReady, setFormReady] = useState(isNew);
  const [busy, setBusy] = useState<'saving' | 'deleting' | null>(null);
  const [error, setError] = useState<string>();

  // Fill the form once the plant is available (the list may still be loading).
  // Done only once, so live updates don't overwrite what you're typing.
  useEffect(() => {
    if (existing && !formReady) {
      setForm(existing);
      setFormReady(true);
    }
  }, [existing, formReady]);

  const update = <K extends keyof Plant>(field: K, value: Plant[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  const goBack = () => (router.canGoBack() ? router.goBack() : router.push('/plants', 'back'));

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Give the plant a name.');
    if (!Number.isInteger(form.wateringIntervalDays) || form.wateringIntervalDays < 1) {
      return setError('Watering interval must be a whole number of days, at least 1.');
    }
    setError(undefined);
    setBusy('saving');
    try {
      await savePlant({ ...form, name: form.name.trim() });
      goBack();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = () =>
    presentAlert({
      header: `Delete ${form.name}?`,
      message: 'This removes the plant from every device.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            setBusy('deleting');
            try {
              await deletePlant(plantId!);
              goBack();
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    });

  // Someone deleted this plant on another device while it was open here.
  const deletedElsewhere = !isNew && formReady && !existing && !busy;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/plants" />
          </IonButtons>
          <IonTitle>{isNew ? 'New plant' : 'Edit plant'}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={handleSave} disabled={!formReady || !!busy || deletedElsewhere}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonLoading isOpen={busy !== null} message={busy === 'deleting' ? 'Deleting…' : 'Saving…'} />

        {!isNew && !formReady && !loading && (
          <p className="ion-padding">
            <IonText color="danger">{loadError ?? 'This plant does not exist.'}</IonText>
          </p>
        )}
        {deletedElsewhere && (
          <p className="ion-padding">
            <IonText color="danger">This plant was deleted on another device.</IonText>
          </p>
        )}
        {error && (
          <p className="ion-padding-horizontal">
            <IonText color="danger">{error}</IonText>
          </p>
        )}

        {formReady && (
          <>
            <IonList inset>
              <IonItem>
                <IonInput
                  label="Name" labelPlacement="stacked" placeholder="e.g. Monstera"
                  value={form.name} onIonInput={(e) => update('name', e.detail.value ?? '')}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="Species" labelPlacement="stacked" placeholder="Optional"
                  value={form.species} onIonInput={(e) => update('species', e.detail.value ?? '')}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="Location" labelPlacement="stacked" placeholder="e.g. Living room"
                  value={form.location} onIonInput={(e) => update('location', e.detail.value ?? '')}
                />
              </IonItem>
              <IonItem>
                <IonToggle checked={form.isIndoor} onIonChange={(e) => update('isIndoor', e.detail.checked)}>
                  Indoor plant
                </IonToggle>
              </IonItem>
            </IonList>

            <IonList inset>
              <IonItem>
                <IonInput
                  label="Water every (days)" labelPlacement="stacked" type="number" min="1" inputmode="numeric"
                  value={form.wateringIntervalDays}
                  onIonInput={(e) => update('wateringIntervalDays', Number(e.detail.value))}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="Last watered" labelPlacement="stacked" type="date" max={today()}
                  value={form.lastWatered ?? ''}
                  onIonInput={(e) => update('lastWatered', e.detail.value || null)}
                />
                <IonButton slot="end" fill="clear" onClick={() => update('lastWatered', today())}>
                  Watered today
                </IonButton>
              </IonItem>
            </IonList>

            <IonList inset>
              <IonItem>
                <IonTextarea
                  label="Notes" labelPlacement="stacked" autoGrow placeholder="Light, soil, anything to remember"
                  value={form.notes} onIonInput={(e) => update('notes', e.detail.value ?? '')}
                />
              </IonItem>
            </IonList>

            {!isNew && (
              <div className="ion-padding">
                <IonButton expand="block" fill="outline" color="danger" onClick={handleDelete} disabled={!!busy}>
                  Delete plant
                </IonButton>
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PlantEdit;
