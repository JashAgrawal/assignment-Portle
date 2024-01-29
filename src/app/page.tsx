import dynamic from "next/dynamic";
import "./globals.css";
const MyEditor = dynamic(() => import("./editor"), { ssr: false });
const Main = () => {
  return (
    <div
      id="container"
      className="flex flex-col  bg-gray-900 w-screen h-screen text-white text-xl overflow-hidden"
    >
      <MyEditor />
    </div>
  );
};
export default Main;
