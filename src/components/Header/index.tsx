import { ActiveLink } from '../ActiveLink';
import { SigInButton } from '../SigInButton';


import styles from './styles.module.scss';

export function Header() {

    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <ActiveLink activeClassName={styles.active} href='/'>
                    <a><img src="/images/logo.svg" alt="ig.news" /></a>
                </ActiveLink>
                <nav>
                    <ActiveLink activeClassName={styles.active} href='/'>
                        <a>Home</a>
                    </ActiveLink>
                    <ActiveLink activeClassName={styles.active} href='/posts'>
                        <a>Posts</a>
                    </ActiveLink>
                </nav>
                <SigInButton />
            </div>
        </header>
    );
}