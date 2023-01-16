import {
  BodyLayout,
  Button,
  Card,
  Grid,
  PageHeader,
  Tabs,
} from "@cedcommerce/ounce-ui";
import React, { useEffect, useRef, useState } from "react";

const Main = () => {
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
      `${baseUrl}/orgs/${process.env.REACT_APP_ORG}/teams/${process.env.REACT_APP_PARENT}/teams`,
      requestOptions
    );
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    teamFetch().then((actualData) => {
      let tempTeam = [];
      actualData.map((item) =>
        tempTeam.push({
          key: item.id,
          id: item.id,
          content:
            item.parent === null
              ? item.name + "( Parent )"
              : item.name + "( Child )",
          slug: item.slug,
          description: item.description,
        })
      );
      setSelected(tempTeam[0].id);
      setTeam([...tempTeam]);
    });
  }, []);

  useEffect(() => {
    if (selected) {
      // MEMBERS OF TEAM
      setMemLoading(true);
      fetch(`${baseUrl}/teams/${selected}/members`, requestOptions)
        .then((res) => res.json())
        .then((actualData) => setMembers(actualData))
        .finally(() => setMemLoading(false));

      // REPOSITORIES OF TEAM
      setRepoLoading(true);
      fetch(`${baseUrl}/teams/${selected}/repos`, requestOptions)
        .then((res) => res.json())
        .then((actualData) => {
          const tempRepo = actualData.map((item) => ({
            key: item.id,
            id: item.id,
            name: item.name,
            repo_url: item.repos_url,
            role_name: item.role_name,
            visibility: item.visibility,
          }));
          setRepo([...tempRepo]);
        })
        .finally(() => setRepoLoading(false));
    }
  }, [selected]);

  const teamChange = (event) => {
    setSelected(event);
  };

  const viewMembership = (name) => {
    fetch(`${baseUrl}/teams/${selected}/memberships/${name}`, requestOptions)
      .then((res) => res.json())
      .then((result) => {
        let tempMem = [...members];
        tempMem.forEach((item) => {
          if (item.login === name) {
            item.role = result.role;
          }
        });
        setMembers([...tempMem]);
      });
  };

  return (
    <>
      <BodyLayout>
        <Card>
          <PageHeader title="Teams:"></PageHeader>
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
                    {
                      align: "center",
                      dataIndex: "role",
                      key: "role",
                      title: "Member Role",
                      width: 100,
                    },
                  ]}
                  dataSource={
                    members.length
                      ? members.map((item) => {
                          return {
                            key: item.id,
                            id: item.id,
                            name: item.login,
                            repo_url: (
                              <a target="_blank" href={item.repos_url}>
                                {item.repos_url}
                              </a>
                            ),
                            role: item.role ?? (
                              <Button type="TextButton">
                                Loading...
                                {viewMembership(item.login)}
                              </Button>
                            ),
                          };
                        })
                      : []
                  }
                />
              </Card>

              <Card>
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
                    {
                      align: "center",
                      dataIndex: "role_name",
                      key: "role_name",
                      title: "Repo Access Level",
                      width: 100,
                    },
                    {
                      align: "center",
                      dataIndex: "visibility",
                      key: "visibility",
                      title: "Repo Visibility",
                      width: 100,
                    },
                  ]}
                  dataSource={repo}
                />
              </Card>
            </Card>
          </Tabs>
        </Card>
      </BodyLayout>
    </>
  );
};

export default Main;
