
import { Workout } from './Workout';

export class Cycling extends Workout {

  public elevationGain: number;
  public speed: number = 0;
  type: string = 'bicicleta';

  constructor(coords: number[], distance: number, duration: number, elevationGain: number){
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calculateSpeed();
    this.setDescription();
  }

  calculateSpeed(){
    // km / h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

