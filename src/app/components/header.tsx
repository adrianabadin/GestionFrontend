"use client";
import React, { useEffect, useState } from "react";
import logo from "@/icons/region.png";
import Image from "next/image";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
  Card,
  Collapse,
  MenuItem,
} from "@material-tailwind/react";
import LoginModal from "./Login";
import SignUpModal from "./Signup";
import { useAppSelector, useAppDispatch } from "@/_core/store";
import { authApiSlice, clearAuth } from "@/_core/auth/_application/slices";
import Link from "next/link";
import Menuitem from "./menuitem";

export function StickyNavbar() {
  const [openNav, setOpenNav] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [signUp, setSignUp] = useState(false);
  const { username } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  const [jwtLogin, { isLoading }] = authApiSlice.endpoints.jwtLogin.useLazyQuery();

  useEffect(() => {
    // Try to load user from JWT cookie on component mount
    jwtLogin(undefined);
  }, [jwtLogin]);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false),
    );
  }, []);
  const data = useAppSelector((state) => state.auth);
  const navList = (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        placeholder={""}
        as="li"
        variant="small"
        color="white"
        className="p-1 font-normal"
      >
        <Link href="#" className="flex items-center">
          Direccion
        </Link>
      </Typography>
      <Typography
        placeholder={""}
        as="li"
        variant="small"
        color="white"
        className="p-1 font-normal"
      >
        <Link href="#" className="flex items-center">
          Territorios
        </Link>
      </Typography>
      <Typography
        placeholder={""}
        as="li"
        variant="small"
        color="white"
        className="p-1 font-normal"
      >
        <Link href="/departments" className="flex items-center">
          Areas
        </Link>
        <Link href="/worklist" className="flex items-center">
          Mis Pendientes
        </Link>
      </Typography>
      {data !== undefined ? (
        data.isAdmin === true ? (
          <Menuitem name="Configuracion" id="config" />
        ) : null
      ) : null}
    </ul>
  );

  return (
    <header className=" max-h-[768px]  top-0  h-32 w-full overflow-hidden  ">
      <Navbar
        className="z-10  max-w-full h-full rounded-none px-4  lg:px-8 lg:py-4 bg-gradient-to-r from-pink-600 to-blue-600 my-auto"
        placeholder={""}
      >
        <div className="flex items-center justify-between text-blue-gray-900 h-full">
          {/* <Typography
            variant="h2"
            as="a"
            color="white"
            href="/"
            className="mr-4 font-sans cursor-pointer py-1.5 font-medium"
          >
            Region Sanitaria X
          </Typography> */}
          <Image src={logo} alt="Region Sanitaria X" width={150} height={150} />
          <div className="flex items-center gap-4">
            <div className="mr-4 hidden lg:block">{navList}</div>
            <div className="flex items-center gap-x-1">
              {username === "" ? (
                <>
                  <Button
                    placeholder={""}
                    variant="text"
                    size="sm"
                    className="hidden text-gray-100 lg:inline-block"
                    onClick={() => setOpen(true)}
                  >
                    <span>Ingresar</span>
                  </Button>
                  <Button
                    placeholder={""}
                    variant="gradient"
                    size="sm"
                    className="hidden lg:inline-block text-gray-100"
                    onClick={() => setSignUp(true)}
                  >
                    <span>Registrarse</span>
                  </Button>
                </>
              ) : isLoading ? (
                <Typography
                  placeholder={""}
                  variant="paragraph"
                  as="p"
                  href="#"
                  color="white"
                  className="font-bold mr-3"
                >
                  Ingresando...
                </Typography>
              ) : (
                <span className="absolute top-2 right-2  flex">
                  <Typography
                    placeholder={""}
                    variant="paragraph"
                    as="p"
                    href="#"
                    color="white"
                    className="font-bold mr-3"
                  >
                    {`Bienvenido ${username}`}
                  </Typography>
                  <Typography
                    placeholder={""}
                    variant="paragraph"
                    as="button"
                    color="gray"
                    onClick={handleLogout}
                    className="hover:font-bold"
                  >
                    Cerrar Sesion
                  </Typography>
                </span>
              )}
            </div>
            <IconButton
              placeholder={""}
              variant="text"
              className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
              ripple={false}
              onClick={() => setOpenNav(!openNav)}
            >
              {openNav ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </IconButton>
          </div>
        </div>
        <Collapse open={openNav}>
          {navList}
          <div className="flex items-center gap-x-1">
            <Button
              placeholder={""}
              fullWidth
              variant="text"
              size="sm"
              className=""
              onClick={() => setOpen((prev) => !prev)}
            >
              <span>Log In</span>
            </Button>
            <Button
              placeholder={""}
              fullWidth
              variant="gradient"
              size="sm"
              className=""
              onClick={() => setSignUp((prev) => !prev)}
            >
              <span>Sign in</span>
            </Button>
          </div>
        </Collapse>
      </Navbar>
      <LoginModal open={open} setOpen={setOpen} />
      <SignUpModal open={signUp} setOpen={setSignUp} />
    </header>
  );
}
