import { useEffect, useState } from "react";

import { Select } from "@/components_v2/select";

import {
  PostsFilters,
  PostStatusOptions,
  SortBy,
} from "@/__generated__/__types__";
import { PageType } from "@/graphql/types";
import { EventAction, track } from "@/track";

import Loading from "../loading";
import { useTagsContext } from "../tags/context";

interface IProps {
  showTags?: boolean;
  onChange: (filters: PostsFilters) => void;
  showPageTypes?: boolean;
  filters: PostsFilters;
  setFilters: (data: PostsFilters) => void;
}

const Filters = ({
  showTags = true,
  onChange,
  showPageTypes = false,
  filters,
  setFilters,
}: IProps) => {
  const [allTags, setAllTags] = useState<{ slug: string; name: string }[]>([]);

  const { tags, loading } = useTagsContext();

  useEffect(() => {
    if (!showTags || showPageTypes) return onChange(filters);

    if (loading || !tags) return;

    const uniqueData = [
      ...tags.reduce((map, obj) => map.set(obj.slug, obj), new Map()).values(),
    ];
    setAllTags(
      uniqueData.map((tag) => ({
        slug: tag.slug,
        name: tag.name,
      }))
    );
  }, [filters, loading, onChange, showPageTypes, showTags, tags]);

  if (loading && showTags) return <Loading />;

  return (
    <div className="flex w-full flex-row items-center justify-end gap-2 ">
      <Select
        id="filters-status"
        onChange={(value) => {
          if (value === "all") {
            const { status, ...rest } = filters;
            onChange({
              ...rest,
            });
            return setFilters({
              ...rest,
            });
          }
          track({
            eventAction: EventAction.Click,
            eventCategory: "filters",
            eventLabel: "status",
          });
          setFilters({
            ...filters,
            status: value as PostStatusOptions,
          });
          onChange({
            ...filters,
            status: value as PostStatusOptions,
          });
        }}
        selected={filters.status ?? "all"}
        items={[
          { key: "all", label: "All" },
          ...Object.values(PostStatusOptions).map((value) => ({
            key: value,
            label: value,
          })),
        ]}
      />
      <Select
        id="filters-sort"
        onChange={(key) => {
          track({
            eventAction: EventAction.Click,
            eventCategory: "filters",
            eventLabel: "sortBy",
          });
          setFilters({ ...filters, sortBy: key as SortBy });
          onChange({ ...filters, sortBy: key as SortBy });
        }}
        selected={filters.sortBy ?? "all"}
        items={[
          ...Object.values(SortBy).map((key) => ({
            key,
            label: key === SortBy.Desc ? "Latest" : "Oldest",
          })),
        ]}
      />
      {allTags && showTags && (
        <Select
          id="filters-tags"
          onChange={(key) => {
            if (key === "all") {
              const { tagSlug, ...rest } = filters;
              return setFilters({
                ...rest,
              });
            }
            track({
              eventAction: EventAction.Click,
              eventCategory: "filters",
              eventLabel: "tagSlug",
            });
            setFilters({ ...filters, tagSlug: key });
            onChange({ ...filters, tagSlug: key });
          }}
          selected={filters.tagSlug ?? "all"}
          items={[
            { key: "all", label: "All Tags" },
            ...allTags.map((tag) => ({
              key: tag.slug,
              label: tag.name,
            })),
          ]}
        />
      )}
      {showPageTypes && (
        <Select
          id="filters-pagetypes"
          onChange={(key) => {
            if (key === "all") {
              const { tagSlug, page_type, ...rest } = filters;
              return setFilters({
                ...rest,
              });
            }
            track({
              eventAction: EventAction.Click,
              eventCategory: "filters",
              eventLabel: "pagetype dropdown",
            });
            setFilters({
              ...filters,
              page_type: key as PageType,
              // type: PostTypes.Page,
            });
            onChange({ ...filters, page_type: key as PageType });
          }}
          selected={filters.page_type ?? "all"}
          items={[
            { key: "all", label: "All" },
            ...Object.keys(PageType).map((type) => ({
              key: PageType[type],
              label: type,
            })),
          ]}
        />
      )}
      <br />
      <br />
    </div>
  );
};

export default Filters;
