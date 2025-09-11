import { createContext, useContext } from "react";



export const AuthContex = createContext({})

export const UserAuth = () => {
  const context = useContext(AuthContex)
  return context
}
export const AuthContexProvider = ({children}) =>{
  return (
    <AuthContex.Provider value={{}}>
      {children}
    </AuthContex.Provider>
  )
}
