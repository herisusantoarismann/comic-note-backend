import { IComic } from 'src/modules/comic/interfaces/comic.interface';

export interface IFavoriteComic {
  id?: number;
  userId?: number;
  comic?: IComic;
}
