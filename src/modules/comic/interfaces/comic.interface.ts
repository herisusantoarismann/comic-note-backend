import { IGenre } from 'src/modules/genre/interaces/genre.interface';
import { ICoverComic } from './cover.interface';

export interface IComic {
  id?: number;
  title: string;
  genres: IGenre[];
  chapter: number;
  updateDay?: number;
  day?: string;
  cover?: ICoverComic;
}
