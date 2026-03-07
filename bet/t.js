const getThirtiethDay = (dateString) => {
  const dateParts = dateString.match(/(\d{2})(\d{2})(\d{4})/);
  if (!dateParts) return null;

  const day = parseInt(dateParts[1]);
  const month = parseInt(dateParts[2]);
  const year = parseInt(dateParts[3]);

  const date = new Date(parseInt(`${year}`), month - 1, day + 30);

  const thDay = date.getDate().toString().padStart(2, '0');
  const thMonth = (date.getMonth() + 1).toString().padStart(2, '0');
  const thYear = date.getFullYear().toString();

  return `${thDay}${thMonth}${thYear}`;
};

console.log(getThirtiethDay('09082025'));