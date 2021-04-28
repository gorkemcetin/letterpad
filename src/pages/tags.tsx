import { Table, Button, Popconfirm, PageHeader } from "antd";
import { Content } from "antd/lib/layout/layout";
import { useState } from "react";
import { Setting } from "@/__generated__/queries/post.mutations.graphql";
import {
  UpdateTagsMutationVariables,
  UpdateTagsMutation,
  UpdateTagsDocument,
  DeleteTagsMutation,
  DeleteTagsMutationVariables,
  DeleteTagsDocument,
} from "@/__generated__/queries/queries.graphql";
import {
  TagsQuery,
  TagsQueryVariables,
} from "@/__generated__/queries/queries.graphql";
import { EditableCell, EditableRow } from "@/components/ediitable-table";
import { initializeApollo } from "@/graphql/apollo";
import { TagsDocument } from "@/graphql/queries/queries.graphql";
import CustomLayout from "@/components/layouts/Layout";
type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key: React.Key;
  name: string;
  id: number;
  desc: string;
  slug: string;
  posts: number;
}

type ColumnTypes = Exclude<EditableTableProps["columns"], undefined>;

const EditableTable = ({
  data,
  settings,
}: {
  data: DataType[];
  settings: Setting;
}) => {
  const [dataSource, setDataSource] = useState<DataType[]>(
    data.map(item => ({
      ...item,
      key: item.id,
      posts: item.posts,
      desc: item.desc,
    })),
  );
  const [count, setCount] = useState(2);

  const handleDelete = async (key: React.Key) => {
    const tagToDelete = [...dataSource].filter(item => item.key === key);
    if (tagToDelete.length > 0 && tagToDelete[0].id > 0) {
      await deleteTagApi(tagToDelete[0].id);
    }
    setDataSource([...dataSource].filter(item => item.key !== key));
  };

  const headers = getHeaders(dataSource, handleDelete);

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = headers.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        required: col.required,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });

  const handleAdd = () => {
    const newData: DataType = {
      key: count + 1,
      name: `new-tag-${count}`,
      id: 0,
      desc: "",
      posts: 0,
      slug: `new-tag-${count}`,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleSave = async (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });

    const { name, id, desc, slug } = row;
    const client = await initializeApollo();
    await client.mutate<UpdateTagsMutation, UpdateTagsMutationVariables>({
      mutation: UpdateTagsDocument,
      variables: {
        data: { name, id, desc, slug },
      },
    });
    setDataSource(newData);
  };

  return (
    <CustomLayout settings={settings}>
      <PageHeader
        onBack={() => window.history.back()}
        className="site-page-header"
        title="Tags"
        style={{ padding: 10 }}
      ></PageHeader>
      <Content style={{ margin: "24px 16px 0" }}>
        <div>
          <Button
            onClick={handleAdd}
            type="primary"
            style={{ marginBottom: 16 }}
          >
            Add a row
          </Button>
          <Table
            components={components}
            rowClassName={() => "editable-row"}
            bordered
            dataSource={dataSource}
            columns={columns as ColumnTypes}
          />
        </div>
      </Content>
    </CustomLayout>
  );
};

export default EditableTable;

export async function getServerSideProps(context) {
  const apolloClient = await initializeApollo({}, context);

  const tags = await apolloClient.query<TagsQuery, TagsQueryVariables>({
    query: TagsDocument,
  });
  if (tags.data.tags?.__typename === "TagsNode") {
    const data = tags.data.tags.rows.map(item => {
      return { ...item, posts: item.posts?.count };
    });
    return {
      props: {
        data,
        error: "",
      },
    };
  } else {
    return {
      props: {
        data: [],
        error:
          tags.data.tags?.__typename === "TagsError"
            ? tags.data.tags.message
            : "",
      },
    };
  }
}

async function deleteTagApi(id) {
  const apolloClient = await initializeApollo();

  const tags = await apolloClient.mutate<
    DeleteTagsMutation,
    DeleteTagsMutationVariables
  >({
    mutation: DeleteTagsDocument,
    variables: {
      id,
    },
  });

  return tags.data?.deleteTags;
}

function getHeaders(dataSource, handleDelete) {
  return [
    {
      title: "name",
      dataIndex: "name",
      width: "30%",
      editable: true,
      required: true,
    },
    {
      title: "desc",
      dataIndex: "desc",
      editable: true,
      required: false,
      render: (_, record: { key: React.Key }) => {
        return (
          _ || (
            <Button type="dashed" size="small">
              Edit
            </Button>
          )
        );
      },
    },
    {
      title: "posts",
      dataIndex: "posts",
    },
    {
      title: "operation",
      dataIndex: "operation",
      render: (_, record: { key: React.Key }) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];
}
