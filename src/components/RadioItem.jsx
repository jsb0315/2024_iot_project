const RadioItem = ({ item, selectedValue, handleRadioChange }) => {
  return (
    <div className="radio">
      <label className="row">
        <input
          type="radio"
          name="topic"
          value={JSON.stringify(item)}
          checked={selectedValue === JSON.stringify(item)}
          onChange={handleRadioChange}
        />
        <div>
          <p className="topic">{item.topic}</p>
          <p className="detail">{item.detail}</p>
        </div>
      </label>
    </div>
  );
};

export default function RadioItems({ getList, getTopic, handleRadioChange }) {
  return (
    <div>
      {getList.length
        ? getList.map((item, index) => (
            <RadioItem
              key={index}
              item={item}
              selectedValue={JSON.stringify(getTopic)}
              handleRadioChange={handleRadioChange}
            />
          ))
        : "<getList Component>"}
    </div>
  );
}
