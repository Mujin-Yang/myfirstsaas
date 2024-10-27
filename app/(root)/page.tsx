import React from 'react'
import { SignInButton, SignedOut} from '@clerk/nextjs'


const Home = () => {
    return(
        <header style={{display: 'flex', justifyContent: 'space-between', padding: 20}}>
            <h1>My App</h1>
            <SignedOut>
                {/* Signed out users get sign in button */}
                <SignInButton/>
            </SignedOut>
        </header>
    )
}

export default Home;
