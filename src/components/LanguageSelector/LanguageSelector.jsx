import { useState, useRef, useEffect } from 'react'
import styles from './LanguageSelector.module.css'

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'ja', name: '日本語' },
  { code: 'pt', name: 'Português' },
  { code: 'zh', name: '中文' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ko', name: '한국어' },
  { code: 'it', name: 'Italiano' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'ru', name: 'Русский' },
  { code: 'sv', name: 'Svenska' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'tl', name: 'Filipino' },
  { code: 'bg', name: 'Български' },
  { code: 'ro', name: 'Română' },
  { code: 'ar', name: 'العربية' },
  { code: 'cs', name: 'Čeština' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'fi', name: 'Suomi' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'da', name: 'Dansk' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'uk', name: 'Українська' },
  { code: 'hu', name: 'Magyar' },
  { code: 'no', name: 'Norsk' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'th', name: 'ไทย' },
  { code: 'he', name: 'עברית' },
  { code: 'ka', name: 'ქართული' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'mr', name: 'मराठी' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
]

export const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const selectedLang = LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage) || LANGUAGE_OPTIONS[0]

  return (
    <div className={styles.languageSelector} ref={dropdownRef}>
      <button
        className={styles.languageButton}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className={styles.languageButtonText}>
          {selectedLang.name}
        </span>
        <span className={styles.languageButtonArrow}>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className={styles.languageDropdown}>
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.languageOption} ${selectedLanguage === lang.code ? styles.languageOptionSelected : ''}`}
              onClick={() => {
                onLanguageChange(lang.code)
                setIsOpen(false)
              }}
              type="button"
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

