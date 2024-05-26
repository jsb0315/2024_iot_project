const CheckboxItem = ({ item, handleCheckboxChange }) => {
  return (
    <div className="check">
      <label>
        <input type="checkbox" name={item} onChange={handleCheckboxChange} />
        {item}
      </label>
    </div>
  );
};

export default function CheckboxItems({ items, handleCheckboxChange }) {
  return (
    <div className="row">
      {items.map((item, index) => (
        <CheckboxItem
          key={index}
          item={item}
          handleCheckboxChange={handleCheckboxChange}
        />
      ))}
    </div>
  );
}
