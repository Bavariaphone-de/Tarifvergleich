import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { RouteClearService } from './app/services/route-clear.service';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    // Initialize global route listener
    appRef.injector.get(RouteClearService);
    
  })
  .catch((err) => console.error(err));
