import { useState } from 'react'
import './App.css'
import "./index.css"
import Routes from './Routes/Routes'
import SettingsMenu from "./screens/Layout/SettingsMenu";
import { ViewModeProvider } from './contexts/ViewModeContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { CollegeProvider } from "./contexts/CollegeContext"; 

function App() {

  return (
    <ViewModeProvider>
      <UserProfileProvider>
        <CollegeProvider>
        <Routes />
        <SettingsMenu />
        </CollegeProvider>
      </UserProfileProvider>
    </ViewModeProvider>
  )
}

export default App
