export interface IComic {
  id?: number;
  title: string;
  genres: {
    id: number;
    name: string;
  }[];
  chapter: number;
  updateDay: number;
  day?: string;
  cover?: string;
}
