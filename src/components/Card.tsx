import Link from 'next/link';

export default function Card({ cardSource }: { cardSource: CardSource }) {
    return (
        <div className="card bg-base-100 w-80 shadow-xl border-solid border hover:scale-105 active:scale-95 transition-transform ease-in-out duration-100">
            <figure>
                <img className="object-cover w-80 h-40" src={cardSource.imgUrl} />
            </figure>
            <div className="card-body">
                <h2 className="card-title">
                    <Link href={cardSource.path}>{cardSource.title}</Link>
                    <div className="badge badge-secondary">{cardSource.badge}</div>
                </h2>
                <p>{cardSource.desc}</p>
                <div className="card-actions justify-end">
                    {
                        cardSource.tags.map(((tag) => {
                            const key = crypto.randomUUID();
                            return (
                                <div key={key} className="badge badge-outline">{tag}</div>
                            )
                        }))
                    }
                </div>
            </div>
        </div>
    )
}