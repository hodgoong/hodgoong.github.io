export default function Button({text}:{text:string}) {
    return (
        <button className="btn btn-active m-4">
            {text}
        </button>
    )
}