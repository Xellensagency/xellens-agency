"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ProjectPaginationData } from "@/lib/dashboard/projects/project-types";
import styles from "./ProjectPagination.module.css";

type ProjectPaginationProps = {
  pagination: ProjectPaginationData;
};

function getPages(
  currentPage: number,
  totalPages: number
) {
  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  return Array.from(pages)
    .filter(
      (page) =>
        page >= 1 &&
        page <= totalPages
    )
    .sort((a, b) => a - b);
}

export default function ProjectPagination({
  pagination,
}: ProjectPaginationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updatePage(
    page: number,
    pageSize?: number
  ) {
    const parameters =
      new URLSearchParams(
        searchParams.toString()
      );

    parameters.set(
      "page",
      String(page)
    );

    if (pageSize) {
      parameters.set(
        "pageSize",
        String(pageSize)
      );
    }

    router.push(
      `${pathname}?${parameters.toString()}`,
      {
        scroll: false,
      }
    );
  }

  const firstItem =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) *
          pagination.page_size +
        1;

  const lastItem = Math.min(
    pagination.page *
      pagination.page_size,
    pagination.total
  );

  const pages = getPages(
    pagination.page,
    pagination.total_pages
  );

  return (
    <footer className={styles.pagination}>
      <p>
        {pagination.total === 0
          ? "Visar 0 projekt"
          : `Visar ${firstItem}–${lastItem} av ${pagination.total} projekt`}
      </p>

      <nav
        className={styles.pages}
        aria-label="Sidnumrering"
      >
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() =>
            updatePage(
              pagination.page - 1
            )
          }
          aria-label="Föregående sida"
        >
          <ChevronLeft
            size={17}
            strokeWidth={1.8}
          />
        </button>

        {pages.map((page, index) => {
          const previous =
            pages[index - 1];

          return (
            <span
              className={styles.pageGroup}
              key={page}
            >
              {previous &&
                page - previous > 1 && (
                  <span
                    className={
                      styles.ellipsis
                    }
                  >
                    …
                  </span>
                )}

              <button
                type="button"
                className={
                  page ===
                  pagination.page
                    ? styles.activePage
                    : ""
                }
                onClick={() =>
                  updatePage(page)
                }
              >
                {page}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          disabled={
            pagination.page >=
            pagination.total_pages
          }
          onClick={() =>
            updatePage(
              pagination.page + 1
            )
          }
          aria-label="Nästa sida"
        >
          <ChevronRight
            size={17}
            strokeWidth={1.8}
          />
        </button>
      </nav>

      <label className={styles.pageSize}>
        <select
          value={pagination.page_size}
          onChange={(event) =>
            updatePage(
              1,
              Number(event.target.value)
            )
          }
          aria-label="Projekt per sida"
        >
          <option value="10">
            10 per sida
          </option>

          <option value="20">
            20 per sida
          </option>

          <option value="50">
            50 per sida
          </option>
        </select>

        <ChevronDown
          size={15}
          strokeWidth={1.7}
        />
      </label>
    </footer>
  );
}
