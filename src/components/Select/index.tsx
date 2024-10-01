import { useState } from "react";
import {
  Select as BaseSelect,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue,
  type Key
} from "react-aria-components";
import Button from "../Button";
import * as styles from "./styles.module.css";

interface Props {
  placeholder: string;
  initialValue: string | number;
  options: { id: string | number; value: string }[];
  onSelect: (key: Key) => void;
}

const Select = ({ initialValue, onSelect, options, placeholder }: Props) => {
  const [selectedItem, setSelectedItem] = useState<Key>(initialValue);

  const onSelectLocal = (selected) => {
    setSelectedItem(selected);
    onSelect(selected);
  };

  return (
    <BaseSelect
      className={styles.select}
      selectedKey={selectedItem}
      onSelectionChange={onSelectLocal}>
      <Button variant="primary">
        <SelectValue className={styles.selectValue}>
          {({ defaultChildren, isPlaceholder }) => {
            return isPlaceholder ? placeholder : defaultChildren;
          }}
        </SelectValue>
        <span aria-hidden="true">▼</span>
      </Button>
      <Popover className={styles.popover}>
        <ListBox className={styles.listBox}>
          {options.map((item) => (
            <ListBoxItem id={item.id} className={styles.listBoxItem}>
              {item.value}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </BaseSelect>
  );
};

export default Select;
