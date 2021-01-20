import React, { useEffect, useRef } from 'react';
import { useField } from '@unform/core'; // função principal do unform

function Input({ name, ...rest }) {
  const inputRef = useRef(null); // usa useRef em todos os componentes de form, inclusive na tag Form

  const { fieldName, registerField, defaultValue, error } = useField(name);

  useEffect(() => {
    // registerField é a função do unform q carrega sempre q o react renderiza
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: 'value' // em que lugar do inputRef.current estão os dados
    })
  }, [fieldName, registerField]);

  return (
    <>
      <input ref={inputRef} defaultValue={defaultValue} {...rest} />
    
      { error && <span style={{ color: '#f00'}}>{error}</span>}
    </>
    
  );
}

export default Input;