

export class Workout {

  public coords: number[];
  public distance: number;
  public duration: number;

  private date: Date = new Date();
  private id: string = crypto.randomUUID();

  constructor(coords: number[], distance: number, duration: number){
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}