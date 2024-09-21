import { FiLogOut, FiChevronDown, FiUser } from "react-icons/fi";
import useAuth from "@/hooks/useAuth";
import NextLink from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { SimpleUser } from "@/types";

export const UserButtonNavbar = () => {
  const supabase = createClient();
  const [userBasicData, setUserBasicData] = useState<SimpleUser | null>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user?.id)
        .returns<SimpleUser[]>();
      if (error) {
        console.error(error);
        return;
      }
      setUserBasicData(data[0]);
    };
    fetchUser();
  }, [user, supabase]);

  return (
    <div
      style={{ display: "flex", justifyContent: "space-between", padding: "20px" }}
      id="header-nav-container"
    >
      <div></div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
        <div style={{ position: "relative", cursor: "pointer" }}>
          <div
            onClick={() => document.getElementById("user-menu")?.classList.toggle("open")}
            style={{
              padding: "8px",
              borderRadius: "8px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={userBasicData?.avatar_url || ""}
                alt={user?.email}
                style={{ width: "32px", height: "32px", borderRadius: "50%", marginRight: "8px" }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginRight: "8px",
                }}
              >
                <p style={{ fontSize: "12px", color: "gray" }}>{user?.email}</p>
              </div>
              <FiChevronDown />
            </div>
          </div>
          <div
            id="user-menu"
            style={{
             
              position: "absolute",
              top: "100%",
              right: 0,
              backgroundColor: "white",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
              zIndex: 10,
              overflow: "hidden",
              transition: "all 0.3s",
            }}
            className="menu-list"
          >
            <div
              style={{
                padding: "8px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: "white",
              }}
            >
              <img
                src={userBasicData?.avatar_url || ""}
                alt={user?.email}
                style={{ width: "48px", height: "48px", borderRadius: "50%", marginRight: "8px" }}
              />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <p style={{ fontSize: "14px", color: "black" }}>
                  {user?.user_metadata.first_name || ""} {user?.user_metadata.last_name || ""}
                </p>
              </div>
            </div>

            <hr style={{ margin: "8px 0" }} />

            <NextLink
              href={`/profile/${user?.id}`}
              style={{
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                textDecoration: "none",
                color: "black",
              }}
            >
              <div>
                <FiUser />
                Profile
              </div>
            </NextLink>

            <div
              onClick={logout}
              style={{
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                color: "black",
              }}
            >
              <FiLogOut />
              Sign out
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
