import React, { useRef, useEffect } from 'react';
import * as Yup from 'yup';
import { Form } from '@unform/web';
import { Scope } from '@unform/core';
import './App.css';

import Input from './components/Form/Input';

// initialData não usa se o form pegar dados de API. Em vez, usa um setData no 
// useEffect (mais explicado abaixo)
const initialData = {
  email: 'foo@bar.com',
  address: {
    street: 'Rua das tetas',
    number: '123'
  }
}

function App() {
  const formRef = useRef(null);

  // O reset limpa o form. 
  async function handleSubmit(data, { reset }) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required('O nome é obrigatório'),
        email: Yup.string()
          .email('Digite um e-mail válido')
          .required('O e-mail ó obrigatório'),
        address: Yup.object().shape({
          street: Yup.string()
            .min(3, 'No mínimo 3 caracteres')
            .required('A cidade é obrigatória')
        })
      });

      await schema.validate(data, {
        abortEarly: false, // Faz todas as validações, em vez de abortar na primeira
      })

      console.log(data);

      formRef.current.setErrors({}); // Limpa erros

      reset(); // Limpa campos
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errorMessages = {};

        err.inner.forEach(error => {
          errorMessages[error.path] = error.message;
        })

        formRef.current.setErrors(errorMessages);
      }
    }
  }

  useEffect(() => {
    // Vou simular uma API, daí vou usar um setTimeOut pra demorar 2 segundos ;)
    setTimeout(() => {
      // setData seta valores nos campos do form
      // Assim como setData, existem outros, como getData, getErrors, 
      // clearField, submit (se eu não quiser q seja botão, muito útil!), etc. 
      formRef.current.setData({
        email: 'foo@bar.com',
        address: {
          street: 'Rua das tetas',
          number: '123'
        }
      });
    }, 2000);
  }, []);

  return (
    <div className="App">
      <h1>Hello World</h1>

      {/**
        * Se os dados do form vierem de uma API, então initialData não será 
        * usado. Em vez, usamos um 'form.current.setData({})' dentro de um 
        * 'useEffect()'.
        */}
      {/* <Form ref={formRef} initialData={initialData} onSubmit={handleSubmit}> */}
      <Form ref={formRef} onSubmit={handleSubmit}>
        <Input name="name" />
        <Input type="email" name="email" />
        <Input type="password"name="password" />

        {/**
         * P/ manipular objetos em form, vc pode fazer de dois jeitos:
         * vc pode usar um ponto pra destrinchar o objeto, ou usar a tag <Scope>
         * 
         * Ex:
         * const user = {
         *  name: "Teta"
         *  address: {
         *    street: "Rua das tetas",
         *    number: 123,
         *  }
         * }
         * 
         * Jeito 1:
         * <Input name="address.street" />
         * <Input name="address.number" />
         * 
         * Jeito 2 (com <Scope>):
         * import { Scope } from '@unform/core;
         * 
         * <Scope path="address">
         *  <Input name="street" />
         *  <Input name="number" />
         * </Scope>
         * 
         */}
        <Input name="address.street" />
        <Input name="address.number" />
        {/* ou */}
        <Scope path="address">
          <Input name="street" />
          <Input name="number" />
        </Scope>
        <button type="submit">Enviar</button>
      </Form>
    </div>
  );
}

export default App;
