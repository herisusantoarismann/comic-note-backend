export const convertDay = (value: number) => {
  switch (value) {
    case 0:
      return 'Monday';
      break;
    case 1:
      return 'Tuesday';
      break;
    case 2:
      return 'Wednesday';
      break;
    case 3:
      return 'Thursday';
      break;
    case 4:
      return 'Friday';
      break;
    case 5:
      return 'Saturday';
      break;
    case 6:
      return 'Sunday';
      break;
    default:
      return 'Invalid Value';
      break;
  }
};
