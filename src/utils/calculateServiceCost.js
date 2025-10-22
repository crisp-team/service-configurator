// utils/calculateServiceCost.js
export const calculateServiceCost = (
  service,
  simCount = 1,
  monthsCount = 12
) => {
  const {
    oneTimePrice = 0,
    monthlyPrice = 0,
    multiplyOneTimeBySimCount = false,
    multiplyMonthlyBySimCount = false,
  } = service;

  const oneTime = multiplyOneTimeBySimCount
    ? oneTimePrice * simCount
    : oneTimePrice;

  const monthly = multiplyMonthlyBySimCount
    ? monthlyPrice * simCount
    : monthlyPrice;

  const total = oneTime + monthly * monthsCount;

  return {
    oneTime,
    monthly,
    total,
  };
};
