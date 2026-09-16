import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import { I18nProvider } from './i18n'
import { AppLayout, Phone } from './ui'
import { Login, Otp, Welcome } from './screens/auth'
import { Discover, Filters } from './screens/discover'
import { Chat, Matches } from './screens/social'
import { Calendar, Documents, NewPet, PetDetails, Pets } from './screens/pets'
import { Admin, Notifications, Profile } from './screens/account'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <Phone>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/welcome" replace />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/otp" element={<Otp />} />
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Discover />} />
                <Route path="matches" element={<Matches />} />
                <Route path="pets" element={<Pets />} />
                <Route path="pets/new" element={<NewPet />} />
                <Route path="profile" element={<Profile />} />
                <Route path="pet/:id" element={<PetDetails />} />
                <Route path="chat/:id" element={<Chat />} />
                <Route path="filters" element={<Filters />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="documents/:petId" element={<Documents />} />
                <Route path="admin" element={<Admin />} />
                <Route path="calendar" element={<Calendar />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </Phone>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
)
