import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '../../utils/translations'
import styles from './LanguageSelector.module.css'

const LANGUAGE_OPTIONS = [
  { code: 'ar', name: 'Arabic' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'fil', name: 'Filipino' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ms', name: 'Malay' },
  { code: 'no', name: 'Norwegian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'es', name: 'Spanish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'ta', name: 'Tamil' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'vi', name: 'Vietnamese' },
]

export const LanguageSelector = ({ selectedLanguage, onLanguageChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0, width: 0 })
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const searchInputRef = useRef(null)
  const t = useTranslation(selectedLanguage)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Close dropdown when disabled
  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false)
    }
  }, [disabled, isOpen])

  // Calculate dropdown position when it opens or window resizes
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          left: rect.left,
          top: rect.bottom + 4,
          width: rect.width
        })
      }
    }

    if (isOpen) {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
      return () => {
        window.removeEventListener('resize', updatePosition)
        window.removeEventListener('scroll', updatePosition, true)
      }
    }
  }, [isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Filter languages based on search query
  const filteredLanguages = LANGUAGE_OPTIONS.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedLang = LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage) || LANGUAGE_OPTIONS[0]

  return (
    <div className={styles.languageSelector} ref={dropdownRef}>
      <button
        ref={buttonRef}
        className={styles.languageButton}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen)
            setSearchQuery('')
          }
        }}
        type="button"
        disabled={disabled}
      >
        <span className={styles.languageButtonText}>
          {selectedLang.name}
        </span>
        <span className={styles.languageButtonArrow}>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className={styles.languageDropdown}
          style={{
            left: `${dropdownPosition.left}px`,
            top: `${dropdownPosition.top}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          <div className={styles.searchContainer}>
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder={t('searchLanguages')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className={styles.languageList}>
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  className={`${styles.languageOption} ${selectedLanguage === lang.code ? styles.languageOptionSelected : ''}`}
                  onClick={() => {
                    onLanguageChange(lang.code)
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                  type="button"
                >
                  {lang.name}
                </button>
              ))
            ) : (
              <div className={styles.noResults}>{t('noLanguagesFound')}</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

