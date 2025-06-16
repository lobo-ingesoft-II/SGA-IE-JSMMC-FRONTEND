"use client"

import type { MouseEventHandler, ReactElement } from "react"
import { AppBar, Badge, IconButton, Link, Stack, Toolbar, Typography } from "@mui/material"
import IconifyIcon from "../../../components/base/IconifyIcon"
import { drawerWidth } from ".."

import { useLocation } from "react-router-dom"
import capitalizePathname from "../../../../helpers/capitalize-pathname"
import AccountDropdown from "./AccountDropdown"

interface TopbarProps {
  handleDrawerToggle: MouseEventHandler
}

const Topbar = ({ handleDrawerToggle }: TopbarProps): ReactElement => {
  const { pathname } = useLocation()
  const title = capitalizePathname(pathname)

  return (
    <AppBar
      sx={{
        width: { lg: `calc(100% - ${drawerWidth}px + 24px)` },
        ml: { lg: `${drawerWidth}px` },
      }}
    >
      <Toolbar
        sx={{
          p: 3.75,
        }}
      >
        <Stack direction="row" gap={1}>
          <Link href="/" width={40} height={40} display={{ xs: "block", lg: "none" }}>
            <IconButton color="inherit" sx={{ p: 0.75, bgcolor: "inherit" }}>
              <IconifyIcon icon="mdi:school" width={24} height={24} />
            </IconButton>
          </Link>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              width: 40,
              height: 40,
              m: 0,
              p: 0.75,
              display: { lg: "none" },
              bgcolor: "inherit",
            }}
          >
            <IconifyIcon icon="mdi:menu" />
          </IconButton>
          <IconButton
            color="inherit"
            sx={{
              width: 40,
              height: 40,
              p: 1,
              display: { xs: "flex", lg: "none" },
              mr: "auto",
              bgcolor: "inherit",
            }}
          >
            <IconifyIcon icon="mdi:search" width={1} height={1} />
          </IconButton>
        </Stack>
        <Stack
          display={{ xs: "none", lg: "flex" }}
          direction="row"
          gap={{ lg: 6.25 }}
          alignItems="center"
          flex={"1 1 auto"}
        >
          <Typography variant="h5" component="h5">
            IED Josué Manrique - Portal Administrativo
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={{ xs: 1, sm: 1.75 }}>
          <AccountDropdown />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}

export default Topbar
