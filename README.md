# Tutorial Unform

Fonte: https://www.youtube.com/watch?v=P65RJTTqkN4

O Unform mudou. Deixou de ser o `unform` pra ser `@unform/core` + (`@unform/web`
ou `@unform/mobile`). Agora ele não fica mais re-renderizando o componente a cada
digitada.

Documentação: https://unform.dev

> Pelo q li no facebook, o `react-hook-form` é o melhor de todos. É tão
> performático qnt o unform, recebe mais integrações com outras libs e é bem
> menos verboso.

## src/components/Form/Input/index.js

O Input agora não é mais feito pela lib. Em vez disso, vc agora faz apenas um
"esqueleto" para o input, e usa o input do HTML ou de uma lib, como material-ui.

> Material-ui está recebendo integração com o unform. Segue a lib de integração
> https://github.com/italoiz/unform-community-packages/tree/master/packages/material-ui

### useField e registerField

A função useField é usada para cada campo de um form. Vc passa a ter acesso aos dados
necessários para colocar em outra função, a `registerField`. A `registerField` é
usada dentro do `useEffect` qnd carrega a página.

```javascript
import React, { useEffect, useRef } from "react";
import { useField } from "@unform/core"; // função principal do unform

function Input({ name, ...rest }) {
  const inputRef = useRef(null); // usa useRef em todos os componentes de form, inclusive na tag Form

  const { fieldName, registerField, defaultValue, error } = useField(name);

  useEffect(() => {
    // registerField é a função do unform q carrega sempre q o react renderiza
    registerField({
      name: fieldName,
      ref: inputRef.current,
      path: "value", // em que lugar do inputRef.current estão os dados
    });
  }, [fieldName, registerField]);

  return (
    <>
      <input ref={inputRef} defaultValue={defaultValue} {...rest} />

      {error && <span style={{ color: "#f00" }}>{error}</span>}
    </>
  );
}

export default Input;
```

## src/components/Form/index.js

Se quiser q os componentes estejam dentro de pastas dentro de componentes, então
tem q ter um export pra cada component desses num index da pasta.

```javascript
export { default as Input } from "./Input";
```

## src/App.js

- Use o component `<Form>` em vez da tag `<form>` do HTML.
- O component `<Scope>` serve para agrupar objeto. Facilita ao escrever a prop
  name do input. Mais abaixo tem exemplo com e sem Scope.
- Se, em vez de vc carregar os dados na tela a partir de um state, vc tiver q
  pegá-los de uma API, então vc não vai carregá-los pelo `initialData`. Em vez
  disso, fará um `setData` em `meuRef.current.setData({})`
- Em `meuRef.current`, vc acessa funções úteis para o form, como:
  - setData
  - setErrors ou setFieldError
  - getData
  - getErrors
  - clearField
  - submit
  - etc...

```javascript
import React, { useRef, useEffect } from "react";
import * as Yup from "yup";
import { Form } from "@unform/web";
import { Scope } from "@unform/core";
import "./App.css";

import Input from "./components/Form/Input";

// initialData não usa se o form pegar dados de API. Em vez, usa um setData no
// useEffect (mais explicado abaixo)
const initialData = {
  email: "foo@bar.com",
  address: {
    street: "Rua das tetas",
    number: "123",
  },
};

function App() {
  const formRef = useRef(null);

  // O reset limpa o form.
  async function handleSubmit(data, { reset }) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required("O nome é obrigatório"),
        email: Yup.string()
          .email("Digite um e-mail válido")
          .required("O e-mail ó obrigatório"),
        address: Yup.object().shape({
          street: Yup.string()
            .min(3, "No mínimo 3 caracteres")
            .required("A cidade é obrigatória"),
        }),
      });

      await schema.validate(data, {
        abortEarly: false, // Faz todas as validações, em vez de abortar na primeira
      });

      console.log(data);

      formRef.current.setErrors({}); // Limpa erros

      reset(); // Limpa campos
    } catch (err) {
      // É feio assim msm
      if (err instanceof Yup.ValidationError) {
        const errorMessages = {};

        err.inner.forEach((error) => {
          errorMessages[error.path] = error.message;
        });

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
        email: "foo@bar.com",
        address: {
          street: "Rua das tetas",
          number: "123",
        },
      });
    }, 2000);
  }, []);

  return (
    <div className='App'>
      <h1>Hello World</h1>

      {/**
       * Se os dados do form vierem de uma API, então initialData não será
       * usado. Em vez, usamos um 'form.current.setData({})' dentro de um
       * 'useEffect()'.
       */}
      {/* <Form ref={formRef} initialData={initialData} onSubmit={handleSubmit}> */}
      <Form ref={formRef} onSubmit={handleSubmit}>
        <Input name='name' />
        <Input type='email' name='email' />
        <Input type='password' name='password' />

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
        <Input name='address.street' />
        <Input name='address.number' />
        {/* ou */}
        <Scope path='address'>
          <Input name='street' />
          <Input name='number' />
        </Scope>
        <button type='submit'>Enviar</button>
      </Form>
    </div>
  );
}

export default App;
```
