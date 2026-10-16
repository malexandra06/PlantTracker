import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { PlantProvider } from './plants/PlantProvider';
import PlantList from './plants/PlantList';
import PlantEdit from './plants/PlantEdit';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
/* Optional CSS utilities (ion-padding, ion-text-center, ...) */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
/* Dark mode follows the phone / computer setting */
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

// Routes:
//   /plants      -> list of all plants
//   /plant       -> add a new plant
//   /plant/:id   -> edit (or delete) a plant
const App: React.FC = () => (
  <IonApp>
    <PlantProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/plants" component={PlantList} />
          <Route exact path="/plant" component={PlantEdit} />
          <Route exact path="/plant/:id" component={PlantEdit} />
          <Route exact path="/" render={() => <Redirect to="/plants" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </PlantProvider>
  </IonApp>
);

export default App;
