import {
  BodyLayout,
  Card,
  Grid,
  PageHeader,
  Sidebar,
  Tabs,
} from "@cedcommerce/ounce-ui";
import React, { useEffect, useState } from "react";

const Main = ({ showTabs }) => {
  const [team, setTeam] = useState([]);
  const [selected, setSelected] = useState();

  const [members, setMembers] = useState([]);
  const [memLoading, setMemLoading] = useState(false);

  const [repo, setRepo] = useState([]);
  const [repoLoading, setRepoLoading] = useState(false);
  const requestOptions = {
    headers: {
      Authorization: process.env.REACT_APP_TOKEN,
    },
  };
  const baseUrl = "https://api.github.com";
  async function teamFetch() {
    const response = await fetch(
      `${baseUrl}/orgs/${process.env.REACT_APP_ORG}/teams`,
      requestOptions
    );
    const data = await response.json();
    return data;
  }
  useEffect(() => {
    teamFetch().then((actualData) => {
      const tempTeam = actualData.map((item) => ({
        id: item.id,
        content: item.name,
        slug: item.slug,
        description: item.description,
        parent: item.parent,
      }));
      setSelected(tempTeam[0].id);
      setTeam([...tempTeam]);
    });
  }, []);

  useEffect(() => {
    setMemLoading(true);
    fetch(`${baseUrl}/teams/${selected}/members`, requestOptions)
      .then((res) => res.json())
      .then((actualData) => {
        const tempMember = actualData.map((item) => ({
          id: item.id,
          name: item.login,
          repo_url: item.repos_url,
        }));
        setMembers([...tempMember]);
      })
      .finally(() => setMemLoading(false));

    setRepoLoading(true);
    fetch(`${baseUrl}/teams/${selected}/repos`, requestOptions)
      .then((res) => res.json())
      .then((actualData) => {
        const tempRepo = actualData.map((item) => ({
          id: item.id,
          name: item.name,
          repo_url: item.repos_url,
        }));
        setRepo([...tempRepo]);
      })
      .finally(() => setRepoLoading(false));
  }, [selected]);

  const teamChange = (event) => {
    setSelected(event);
  };
  console.log(team);
  return (
    <>
      <BodyLayout>
        <Card>
          <PageHeader title="Teams"></PageHeader>
          <Tabs
            className="main-tab"
            alignment="horizontal"
            animate="type1"
            onChange={(event) => teamChange(event)}
            selected={selected}
            value={team}
          >
            <hr />
            <Card>
              <h2>Members: </h2>
              <Grid
                loading={memLoading}
                columns={[
                  {
                    align: "center",
                    dataIndex: "name",
                    key: "name",
                    title: "Name",
                    width: 100,
                  },
                  {
                    align: "center",
                    dataIndex: "repo_url",
                    key: "repo_url",
                    title: "repo_url",
                    width: 100,
                  },
                ]}
                dataSource={members}
              />
              <h2>Repositories:</h2>

              <Grid
                loading={repoLoading}
                columns={[
                  {
                    align: "center",
                    dataIndex: "name",
                    key: "name",
                    title: "Name",
                    width: 100,
                  },
                ]}
                dataSource={repo}
              />
            </Card>
          </Tabs>
        </Card>
      </BodyLayout>
    </>
  );
};

export default Main;
