"use client"

import { useState, useEffect } from 'react'
import { getProviders, signIn } from 'next-auth/react'
import Button from './Button'

type Provider = {
    id          : string
    name        : string
    type        : string
    signinUrl   : string
    callbackUrl : string
    signinUrlParams?: Record< string, string > | null
}
type Providers = Record< string, Provider >

const AuthProviders = () => {
  const [providers, setProviders] = useState<Providers | null >(null)

  useEffect(()=>{
    const fetchProvider = async () => {
        const res = await getProviders()
        //console.log("fetchProvider", res);
        setProviders(res)
    }

    fetchProvider()
  }, [])
  
  if(providers){
    return (
        <div>
            {Object.values(providers).map((provider: Provider, i) => (
                <Button 
                    key={i}
                    title="Sign In"
                    handleClick={()=> signIn(provider?.id)}               
                   
                />
            ))}
        </div>
    )
  }
}

export default AuthProviders