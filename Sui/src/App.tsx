import { Header } from "./components/Header";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Container } from "@radix-ui/themes";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Container>
        <Header />
      </Container>
      <Outlet></Outlet>
    </>
  );
}

export default App;
