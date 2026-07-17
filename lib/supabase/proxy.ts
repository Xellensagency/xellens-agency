import {
  createServerClient,
} from "@supabase/ssr";

import {
  NextResponse,
  type NextRequest,
} from "next/server";

function redirectWithCookies(
  request: NextRequest,
  sourceResponse: NextResponse,
  pathname: string
) {
  const url =
    request.nextUrl.clone();

  url.pathname = pathname;
  url.search = "";

  const redirectResponse =
    NextResponse.redirect(url);

  sourceResponse.cookies
    .getAll()
    .forEach(
      (cookie) => {
        redirectResponse.cookies.set(
          cookie.name,
          cookie.value,
          cookie
        );
      }
    );

  return redirectResponse;
}

export async function updateSession(
  request: NextRequest
) {
  let response =
    NextResponse.next({
      request,
    });

  const supabase =
    createServerClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(
              ({
                name,
                value,
              }) => {
                request.cookies.set(
                  name,
                  value
                );
              }
            );

            response =
              NextResponse.next({
                request,
              });

            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                response.cookies.set(
                  name,
                  value,
                  options
                );
              }
            );
          },
        },
      }
    );

  const {
    data: claimsData,
  } =
    await supabase.auth.getClaims();

  const isLoggedIn =
    Boolean(
      claimsData?.claims?.sub
    );

  const pathname =
    request.nextUrl.pathname;

  const hostname =
    (
      request.headers.get(
        "host"
      ) ?? ""
    )
      .split(":")[0]
      .toLowerCase();

  const isCustomerDomain =
    hostname ===
    "kund.xellensagency.com";

  const isDashboardRoute =
    pathname.startsWith(
      "/dashboard"
    );

  const isPortalRoute =
    pathname === "/portal" ||
    pathname.startsWith(
      "/portal/"
    );

  if (
    isCustomerDomain &&
    pathname === "/"
  ) {
    return redirectWithCookies(
      request,
      response,
      isLoggedIn
        ? "/portal"
        : "/logga-in"
    );
  }

  if (
    isCustomerDomain &&
    isDashboardRoute
  ) {
    return redirectWithCookies(
      request,
      response,
      "/portal"
    );
  }

  if (
    !isLoggedIn &&
    isDashboardRoute
  ) {
    return redirectWithCookies(
      request,
      response,
      "/"
    );
  }

  if (
    !isLoggedIn &&
    isPortalRoute
  ) {
    return redirectWithCookies(
      request,
      response,
      "/logga-in"
    );
  }

  return response;
}
