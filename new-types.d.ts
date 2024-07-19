type CardSource = {
    id: number,
    title: string,
    badge: string,
    desc: string,
    imgUrl: string,
    tags: string[],
    path: string
}

type NavBarSource = {
    title: string,
    menus: NavBarMenuSource[]
}

type NavBarMenuSource = {
    id: number,
    menuTitle: string,
    path: string
}