import { localStorageVariables } from "../constant/app";

export const setToken = (token:string) => {
    localStorage.setItem(localStorageVariables.access_token, token);
  };
  
  export const getToken = () => {
    var data = localStorage.getItem(localStorageVariables.access_token);
    if (data) {
      return data;
    } else return null;
  };
  
  export const removeToken = () => {
    localStorage.removeItem(localStorageVariables.access_token);
 };