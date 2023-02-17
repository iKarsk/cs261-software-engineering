import styles from './page.module.css'
import Link from 'next/link';


export default function Home() {
  return (
    <div className={styles.container}>
      <p><span className={styles.magic}>Hello.</span></p>
      <Link href="/login"><p className={styles.subtext}>Login.</p></Link>
    </div>
  )
}
