import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, IconButton, ListItem } from '@mui/material';
import { Clear as ClearIcon, DragHandle as DragHandleIcon } from '@mui/icons-material';

import AttributeAutoComplete from './widgets/attribute-autocomplete';
import { defaultHeaders } from './device-groups';
import { ATTRIBUTE_SCOPES } from '../../constants/deviceConstants';

const DraggableListItem = ({ item, index, onRemove }) => {
  const title = useMemo(() => {
    const flump = Object.values(defaultHeaders).find(thing => thing.attribute === item.key);
    return item.title || flump || item.key;
  }, [item]);

  const onClick = () => onRemove(item, index);

  return (
    <Draggable draggableId={item.key} index={index}>
      {provided => (
        <ListItem className="flexbox space-between margin-right-large" ref={provided.innerRef} {...provided.draggableProps}>
          <div>{title}</div>
          <div className="flexbox space-between" style={{ width: 80 }}>
            <div {...provided.dragHandleProps} className="flexbox centered">
              <DragHandleIcon />
            </div>
            <IconButton onClick={onClick} size="small">
              <ClearIcon color="disabled" />
            </IconButton>
          </div>
        </ListItem>
      )}
    </Draggable>
  );
};

const columnLimit = 5;

const filterAttributes = (list, attribute) => list.filter(item => !(item.key === attribute.key && item.scope === attribute.scope));

export const ColumnCustomizationDialog = ({ attributes, columnHeaders, idAttribute, onCancel, onSubmit, ...props }) => {
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [isAtColumnLimit, setIsAtColumnLimit] = useState(selectedAttributes.length >= columnLimit);
  const buttonRef = useRef();

  useEffect(() => {
    const { attributeOptions, selectedAttributes } = columnHeaders.reduce(
      (accu, { attribute, title }, index) => {
        // we skip the first/ id column + exclude the status column from customization
        if (index && attribute.name && !(attribute.name === 'status' && attribute.scope === ATTRIBUTE_SCOPES.identity)) {
          const currentAttribute = { ...attribute, key: attribute.name, id: `${attribute.scope}-${attribute.name}`, title };
          accu.selectedAttributes.push(currentAttribute);
          accu.attributeOptions = filterAttributes(accu.attributeOptions, currentAttribute);
        }
        return accu;
      },
      {
        attributeOptions: [...attributes.filter(item => !([idAttribute, 'status'].includes(item.key) && item.scope === ATTRIBUTE_SCOPES.identity))],
        selectedAttributes: []
      }
    );
    setSelectedAttributes(selectedAttributes);
    setAttributeOptions(attributeOptions);
  }, [attributes, columnHeaders]);

  useEffect(() => {
    const isAtColumnLimit = selectedAttributes.length >= columnLimit;
    if (isAtColumnLimit && buttonRef.current) {
      buttonRef.current.focus();
    }
    setIsAtColumnLimit(isAtColumnLimit);
  }, [selectedAttributes.length]);

  const onDragEnd = ({ destination, source }) => {
    if (!destination) {
      return;
    }
    const result = [...selectedAttributes];
    const [removed] = result.splice(source.index, 1);
    result.splice(destination.index, 0, removed);
    setSelectedAttributes(result);
  };

  const onHandleSubmit = () => {
    const attributes = selectedAttributes.map(attribute => ({
      id: attribute.id,
      key: attribute.key,
      name: attribute.key,
      scope: attribute.scope,
      title: attribute.title || attribute.key
    }));
    onSubmit(attributes);
  };

  const onRemove = (attribute, index) => {
    let selection = [];
    let removed = attribute;
    if (index !== undefined) {
      selection = [...selectedAttributes];
      const [removedAttribute] = selection.splice(index, 1);
      removed = removedAttribute;
    } else {
      selection = filterAttributes(selectedAttributes, attribute);
    }
    setSelectedAttributes(selection);
    setAttributeOptions([...attributeOptions, removed]);
  };

  const onSelect = attribute => {
    if (attribute.key) {
      const existingAttribute = attributeOptions.find(item => item.key === attribute.key && item.scope === attribute.scope) || attribute;
      setSelectedAttributes([
        ...selectedAttributes,
        { ...existingAttribute, title: existingAttribute.value ?? existingAttribute.key, id: `${attribute.scope}-${attribute.key}` }
      ]);
      setAttributeOptions(filterAttributes(attributeOptions, attribute));
    }
  };

  return (
    <Dialog open>
      <DialogTitle>Customize Columns</DialogTitle>
      <DialogContent>
        <p>You can select up to 5 columns of inventory data to display in the device list table. Drag to change the order.</p>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable-list" direction="vertical">
            {provided => {
              return (
                <div ref={provided.innerRef} {...provided.droppableProps} {...props}>
                  {selectedAttributes.map((item, index) => (
                    <DraggableListItem item={item} index={index} key={item.key} onRemove={onRemove} />
                  ))}
                  {provided.placeholder}
                </div>
              );
            }}
          </Droppable>
        </DragDropContext>
        <FormControl>
          <AttributeAutoComplete attributes={attributeOptions} disabled={isAtColumnLimit} label="Add a column" onRemove={onRemove} onSelect={onSelect} />
          {isAtColumnLimit && <FormHelperText>Maximum of {columnLimit} reached</FormHelperText>}
        </FormControl>
      </DialogContent>
      <DialogActions className="space-between">
        <Button variant="text" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onHandleSubmit} color="secondary" ref={buttonRef}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnCustomizationDialog;