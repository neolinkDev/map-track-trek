import * as L from 'leaflet';
import { validInputs, validatePositiveNumber } from '../helpers';
import { Workout, Running, Cycling } from '.';

const d = document;

const $form = d.querySelector('.form') as HTMLFormElement,
      $inputDistance = d.querySelector('.form__input--distance') as HTMLInputElement,
      $containerWorkouts = d.querySelector('.workouts') as HTMLUListElement,
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
  private mapZoomLevel: number = 14;

  constructor() {
    // get position
    this.getPosition();

    // get data from localStorage
    this.getLocalStorage();

    $form.addEventListener('submit', (e) => this.newWorkout(e));
    $inputType.addEventListener('change', this.toggleElevationField);
    $containerWorkouts.addEventListener('click', (e) => this.moveToPopup(e));
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

    this.map = L.map('map').setView([latitude, longitude], this.mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // handle clicks on map
    this.map.on('click', (mapE) => this.showForm(mapE));

    // Type check for Running and Cycling workout classes to render their respective workouts
    this.workouts.forEach((workout) => {
      // this.renderWorkout(workout);
      this.renderWorkoutMarker(workout)
    });
  }

  //
  private showForm(mapE: L.LeafletMouseEvent): void {
    this.mapEvent = mapE;
    $form.classList.remove('hidden');
    $inputDistance.focus();
  }

  //
  private hideForm() {
    // clear inputs
    $inputDistance.value =
      $inputDuration.value =
      $inputCadence.value =
      $inputElevation.value =
        '';
    $form.style.display = 'none';
    $form.classList.add('hidden');

    setTimeout(() => {
      $form.style.display = 'grid';
    }, 1000);
  }

  //
  private toggleElevationField(): void {
    $inputCadence.closest('.form__row')?.classList.toggle('form__row--hidden');
    $inputElevation
      .closest('.form__row')
      ?.classList.toggle('form__row--hidden');
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
    if (type === 'running') {
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
    if (type === 'cycling') {
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
    this.workouts.push(workout);
    // console.log(workout);

    // show workout on the map as marker
    this.renderWorkoutMarker(workout);

    // show workout on list
    this.renderWorkout(workout);

    // clear inputs & hide form
    this.hideForm();

    // set localStorage for workouts
    this.setLocalStorage();
  }

  //
  private renderWorkoutMarker(workout: Workout) {
    L.marker({ lat: workout.coords[0], lng: workout.coords[1] })
      .addTo(this.map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'corriste' ? '🏃' : '🚴'} ${workout.description}`
      )
      .openPopup();
  }

  //
  private renderWorkout(workout: Workout) {
    let renderHTML = `
      <li class="workout workout--${workout.type}" data-id=${workout.id}>
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'corriste' ? '🏃' : '🚴'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'corriste') {
      // Type check to ensure that 'workout' is of type 'Running'
      // Verificación de tipo para asegurarse de que 'workout' es de tipo 'Running'
      const runningWorkout = workout as Running;

      renderHTML += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${runningWorkout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${runningWorkout.cadence}</span>
          <span class="workout__unit">ppm</span>
        </div>
      </li>
      `;
    }

    if (workout.type === 'bicicleta') {
      const cyclingWorkout = workout as Cycling;

      const { speed, elevationGain } = cyclingWorkout;

      renderHTML += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;
    }
    $form.insertAdjacentHTML('afterend', renderHTML);
  }

  // moves the map by clicking on the workout container
  private moveToPopup(e: Event) {
    const workoutElement = (e.target as HTMLLIElement).closest('.workout');
    if (!workoutElement) return;

    const workoutID = workoutElement.getAttribute('data-id');
    if (!workoutID) return;

    const workout = this.workouts.find((work) => work.id === workoutID);

    let latlng = L.latLng(workout!.coords[0], workout!.coords[1]);

    // use setWiew method from leaflet
    this.map.setView(latlng, this.mapZoomLevel);
  }

  //
  private setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.workouts));
  }

  //
  private getLocalStorage(): void {
    const data = localStorage.getItem('workouts') ?? '[]';
    const parsedData: Workout[] = JSON.parse(data);
    this.workouts = parsedData;

    // Type check for Running and Cycling workout classes to render their respective workouts
    this.workouts.forEach((workout) => {
      this.renderWorkout(workout);
    });
  }
}

export const app = new App();