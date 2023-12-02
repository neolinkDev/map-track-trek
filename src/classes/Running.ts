
import { Workout } from './Workout';

export class Running extends Workout {

  public cadence: number;
  public pace: number = 0;
  type: string = 'corriste';

  constructor(coords: number[], distance: number, duration: number, cadence: number){
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calculatePace();
    this.setDescription();
  }

  //
  calculatePace(){
    // min / km
    this.pace = this.duration / this.distance
    return this.pace;
  }
}
