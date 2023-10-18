const Price = ({
  totalAmount,
  priceDifferenceDirection,
  priceDifference,
}: {
  totalAmount: number;
  priceDifferenceDirection: boolean;
  priceDifference: number;
}) => {
  let symbol;
  let differenceClass;
  if (priceDifference) {
    symbol = priceDifferenceDirection ? "↑" : "↓";
	differenceClass = priceDifferenceDirection ? 'green' : 'red'
  }
  return (
    <div className="price-container">
      <div>{totalAmount} WUC</div>
      <div className={differenceClass}>
        {symbol} {priceDifference}
      </div>
    </div>
  );
};

export default Price;
