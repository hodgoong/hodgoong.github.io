import Card from '@/components/Card';

const dummyInputs: CardSource[] = [
  {
    id: 1,
    title: "test title",
    desc: "test desc",
    imgUrl: "https://4.img-dpreview.com/files/p/E~TS1180x0~articles/3925134721/0266554465.jpeg",
    badge: "test",
    tags: ["test", "looking good"],
    path: "/works/test-detail-page"
  },
  {
    id: 2,
    title: "test title2",
    desc: "test desc2",
    imgUrl: "https://letsenhance.io/static/8f5e523ee6b2479e26ecc91b9c25261e/1015f/MainAfter.jpg",
    badge: "product",
    tags: ["test1", "looking good"],
    path: "/works/test-detail-page"
  },
  {
    id: 3,
    title: "test title3",
    desc: "test desc3",
    imgUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREoRGyXmHy_6aIgXYqWHdOT3KjfmnuSyxypw&s",
    badge: "good",
    tags: ["test2", "looking good"],
    path: "/works/test-detail-page"
  },
  {
    id: 4,
    title: "test title4",
    desc: "test desc4",
    imgUrl: "https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630",
    badge: "test",
    tags: ["test3", "looking good"],
    path: "/works/test-detail-page"
  }
]

export default function Home() {
  return (
    <main className="flex flex-col mb-auto items-center justify-between p-24">
    Works Page - Under Construction
    {/* <Button text={'test'}/> */}
</main >
    // <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
    //   {
    //     dummyInputs.map((input => <Card key={input.id} cardSource={input} />))
    //   }
    // </main >
  );
}