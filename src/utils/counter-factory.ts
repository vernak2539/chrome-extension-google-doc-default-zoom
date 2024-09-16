const counterFactory = () => {
  let count = 0;

  return {
    getCount: () => count,
    increment: () => {
      count++;
    }
  };
};

export default counterFactory;
