import * as L from 'leaflet';
import { validInputs, validatePositiveNumber } from '../helpers';
import { Running } from './Running';
import { Cycling } from './Cycling';
import { Workout } from './Workout';
// import { Workout } from './Workout';

const d = document;

const $form = d.querySelector('.form')!,
      $inputDistance = d.querySelector('.form__input--distance') as HTMLInputElement,
      $containerWorkouts = d.querySelector('.workouts')!,
      $inputType = d.querySelector('.form__input--type') as HTMLSelectElement,
      $inputDuration = d.querySelector('.form__input--duration') as HTMLInputElement,
      $inputCadence = d.querySelector('.form__input--cadence') as HTMLInputElement,
      $inputElevation = d.querySelector('.form__input--elevation') as HTMLInputElement;

// Definición de tipos para la API de geolocalización
// definition types for the geolocation API
interface GeolocationPosition {
  coords: GeolocationCoordinates;
  timestamp: number;
}

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

//
export class App {

  private map!: L.Map;
  private mapEvent!: L.LeafletMouseEvent;
  private workouts: Workout[] = [];

  constructor() {
    this.getPosition();
    $form.addEventListener('submit', (e) => this.newWorkout(e));
    $inputType.addEventListener('change', this.toggleElevationField)
    
  }

  //
  private getPosition(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // this.loadMap.bind(this),
        (position) => this.loadMap(position),

        () => {
          alert('No se pudo determinar tu ubicación');
        }
      );
    }
  }

  //
  private loadMap(position: GeolocationPosition): void {

    const { latitude, longitude } = position.coords;

    // console.log(`https://www.google.com.mx/maps/@${latitude},${longitude}`);

    this.map = L.map('map').setView([latitude, longitude], 13);
    // console.log(map)

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // handle clicks on map
    this.map.on('click', (mapE) => this.showForm(mapE));
  }

  //
  private showForm(mapE: L.LeafletMouseEvent): void {
    this.mapEvent = mapE;
    $form.classList.remove('hidden');
    // $inputDistance.focus();
  }

  //
  private toggleElevationField(): void {
    $inputCadence.closest('.form__row')?.classList.toggle('form__row--hidden');
    $inputElevation.closest('.form__row')?.classList.toggle('form__row--hidden');
  }

  //
  private newWorkout(e: Event) {
    e.preventDefault();

    // data from form
    const type = $inputType.value;
    const distance = Number($inputDistance.value);
    const duration = Number($inputDuration.value);
    const { lat, lng } = this.mapEvent.latlng;
    let workout!: Running | Cycling;

    // if type is 'running'
    if(type === 'running'){
      const cadence = Number($inputCadence.value);

      // validation
      if (
        !validInputs(distance, duration, cadence) ||
        !validatePositiveNumber(distance, duration, cadence)
      ) {
        return alert('Ingrese solo números positivos');
      }
      
      workout = new Running([lat, lng], distance, duration, cadence);
      
    }

    // if type is 'cycling'
    if(type === 'cycling'){
      const elevation = Number($inputElevation.value);

      // validation
      if (
        !validInputs(distance, duration, elevation) ||
        !validatePositiveNumber(distance, duration)
      ) {
        return alert('Ingrese solo números positivos');
      }
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.workouts.push( workout );
    console.log(workout)

    // show workout on the map as marker
    this.renderWorkoutMarker(workout)
    
    // show workout on list


    // clear inputs
    $inputDistance.value = $inputDuration.value = $inputCadence.value = $inputElevation.value = '';
  }

  //
  renderWorkoutMarker(workout: Running | Cycling){
    
    L.marker({ lat: workout.coords[0], lng: workout.coords[1] })
      .addTo(this.map)
      .bindPopup(L.popup({ 
        maxWidth: 250, 
        minWidth: 100,
        autoClose: false ,
        closeOnClick: false,
        className: `${workout.type}-popup`
      }))
      .setPopupContent('Ejercicio')
      .openPopup();
  }
    
}

export const app = new App();