import {
  IonBadge, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonItem,
  IonLabel, IonList, IonLoading, IonNote, IonPage, IonText, IonTitle, IonToolbar,
} from '@ionic/react';
import { add, homeOutline, sunnyOutline, waterOutline } from 'ionicons/icons';
import { Plant } from './Plant';
import { usePlants } from './PlantProvider';
import { wateringStatus } from './watering';
import './plants.css';

const PlantListItem: React.FC<{ plant: Plant }> = ({ plant }) => {
  const status = wateringStatus(plant);
  const details = [plant.species, plant.location].filter(Boolean).join(', ');

  return (
    <IonItem routerLink={`/plant/${plant.id}`} detail={false}>
      <IonIcon
        slot="start"
        icon={plant.isIndoor ? homeOutline : sunnyOutline}
        aria-label={plant.isIndoor ? 'Indoor' : 'Outdoor'}
        color="primary"
      />
      <IonLabel>
        <h2>{plant.name}</h2>
        {details && <p>{details}</p>}
      </IonLabel>
      <IonBadge slot="end" color={status.color} className="plant-badge">
        <IonIcon icon={waterOutline} aria-hidden="true" />
        {status.text}
      </IonBadge>
    </IonItem>
  );
};

const PlantList: React.FC = () => {
  const { plants, loading, loadError, connected } = usePlants();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My plants</IonTitle>
          <IonButtons slot="end">
            <IonNote className={`live-status ${connected ? 'on' : ''}`}>
              {connected ? 'Live' : 'Offline'}
            </IonNote>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonLoading isOpen={loading && plants.length === 0} message="Loading plants…" />

        {loadError && (
          <div className="ion-padding">
            <IonText color="danger">{loadError}</IonText>
          </div>
        )}

        {!loading && !loadError && plants.length === 0 && (
          <p className="empty-state">No plants yet. Tap + to add your first one.</p>
        )}

        <IonList>
          {plants.map((plant) => (
            <PlantListItem key={plant.id} plant={plant} />
          ))}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/plant" aria-label="Add plant">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default PlantList;
