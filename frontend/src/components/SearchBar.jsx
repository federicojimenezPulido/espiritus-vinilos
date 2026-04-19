import { useLang } from '../LangContext'
import styles from './SearchBar.module.css'

export default function SearchBar({ search, setSearch, coll }) {
  const { t } = useLang()
  const placeholder = coll === 'vinyl' ? t('searchVinyl') : t('searchSpirits')

  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>🔍</span>
      <input
        className={styles.input}
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={placeholder}
      />
      {search && (
        <button className={styles.clear} onClick={() => setSearch('')}>✕</button>
      )}
    </div>
  )
}
