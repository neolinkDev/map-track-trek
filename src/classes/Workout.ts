

export class Workout {

  public coords: number[];
  public distance: number;
  public duration: number;
  public description!: string;
  public type!: string;
  
  private date: Date = new Date();
  public id: string = crypto.randomUUID();

  constructor(coords: number[], distance: number, duration: number){
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  protected setDescription(){

    this.description = `
      ${this.type[0].toUpperCase()}${this.type.slice(1)} el ${ this.formatDate( this.date)}
    `;
  }
  
  private formatDate = (date: Date): string => {
    const newDate = new Date(date);
  
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    };
  
    return newDate.toLocaleDateString('es-ES', options);
  };
}