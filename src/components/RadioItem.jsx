import React, { useState, useEffect } from "react";
import "./RadioItem.css"

// 텍스트 애니메이션 로직을 분리한 Hook
const useTypeText = (textArray, delay = 50) => {
  const [animatedTexts, setAnimatedTexts] = useState(["", ""]);
  const [currentIndices, setCurrentIndices] = useState([0, 0]);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (textIndex < textArray.length) {
      const text = textArray[textIndex];
      const currentIndex = currentIndices[textIndex];

      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setAnimatedTexts(prevTexts => {
            const newTexts = [...prevTexts];
            newTexts[textIndex] = prevTexts[textIndex] + text[currentIndex];
            return newTexts;
          });
          setCurrentIndices(prevIndices => {
            const newIndices = [...prevIndices];
            newIndices[textIndex] = prevIndices[textIndex] + 1;
            return newIndices;
          });
        }, delay);

        return () => clearTimeout(timer);
      } else {
        setCurrentIndices([0, 0]);
        setTextIndex(prevIndex => prevIndex + 1);
      }
    }
  }, [currentIndices, textArray, delay, textIndex]);

  return animatedTexts;
};

const RadioItem = ({ item, selectedValue, handleRadioChange }) => {
  const [animatedTopic, animatedDetail] = useTypeText([
    item.topic,
    item.detail,
  ]);

  return (
    <div className="radio">
      <label className="rodio_row">
        <input
          type="radio"
          name="topic"
          value={JSON.stringify(item)}
          checked={selectedValue === JSON.stringify(item)}
          onChange={handleRadioChange}
        />
        <div className="inner">
          <p className="topic">{animatedTopic}
            {animatedTopic!==item.topic&&<span className="cursor"></span>}
          </p>
          <p className="detail">{animatedDetail}
            {animatedDetail!==item.detail&&<span className="cursor"></span>}
          </p>
        </div>
      </label>
    </div>
  );
};

export default function RadioItems({
  getList,
  getTopic,
  handleRadioChange,
  isLoading,
}) {
  return (
    <div className="Radiodiv">
      {isLoading ? (
        <p>Loading...</p>
      ) : getList.length > 0 ? (
        getList.map((item, index) => (
          <RadioItem
            key={index}
            item={item}
            selectedValue={JSON.stringify(getTopic)}
            handleRadioChange={handleRadioChange}
          />
        ))
      ) : (
        <p><span className="cursor"></span></p>
      )}
    </div>
  );
}
