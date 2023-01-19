import {
  BodyLayout,
  Button,
  Card,
  FlexChild,
  FlexLayout,
  Grid,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  Tabs,
} from "@cedcommerce/ounce-ui";
import React, { useEffect, useState } from "react";
import { List, PlusCircle } from "react-feather";

const Main = () => {
  const [team, setTeam] = useState([]);
  const [selected, setSelected] = useState();
  const [teamType, setTeamType] = useState("Child");
  const [perPageData, setPerPageData] = useState(5);

  const [members, setMembers] = useState([]);
  const [countMember, setCountMember] = useState(5);
  const [totalMemberLength, setTotalMemberLength] = useState(0);
  const [memLoading, setMemLoading] = useState(false);

  const [repo, setRepo] = useState([]);
  const [countRepo, setCountRepo] = useState(5);
  const [totalRepoLength, setTotalRepoLength] = useState(0);
  const [repoLoading, setRepoLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repoCollaborator, setRepoCollaborator] = useState([]);
  const [loadingCollaborator, setLoadingCollaborator] = useState(false);

  const requestOptions = {
    headers: {
      Authorization: process.env.REACT_APP_TOKEN,
    },
  };
  const baseUrl = "https://api.github.com";

  // DATA OF ALL TEAMS
  async function teamFetch() {
    const response = await fetch(
      `${baseUrl}/orgs/${process.env.REACT_APP_ORG}/teams/${process.env.REACT_APP_PARENT}/teams`,
      requestOptions
    );
    const data = await response.json();
    return data;
  }

  async function parentTeamFetch() {
    const response = await fetch(
      `${baseUrl}/orgs/${process.env.REACT_APP_ORG}/teams/${process.env.REACT_APP_PARENT}`,
      requestOptions
    );
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    teamFetch().then((actualData) => {
      const tempChildTeam = actualData.map((item) => {
        return item;
      });

      if (tempChildTeam.length === 0) {
        parentTeamFetch().then((res) => {
          setTeamType("Parent");
          let parentTeam = [];
          parentTeam.push(res);
          setSelected(parentTeam[0].id);
          setTeam(parentTeam);
        });
      } else {
        setTeam(tempChildTeam);
        setSelected(tempChildTeam[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selected) {
      fetch(`${baseUrl}/teams/${selected}/members`, requestOptions)
        .then((res) => res.json())
        .then((data) => setTotalMemberLength(data.length));
      memberFetch(countMember);

      fetch(`${baseUrl}/teams/${selected}/repos`, requestOptions)
        .then((res) => res.json())
        .then((data) => setTotalRepoLength(data.length));
      repoFetch(countRepo);
    }
  }, [selected]);

  // REPOSITORIES OF TEAM
  const repoFetch = (count) => {
    setRepoLoading(true);
    fetch(
      `${baseUrl}/teams/${selected}/repos?per_page=${count}`,
      requestOptions
    )
      .then((res) => res.json())
      .then((actualData) => {
        setRepo(actualData);
      })
      .finally(() => setRepoLoading(false));
  };

  const viewCollaborator = (name) => {
    setSelectedRepo(name);
    setLoadingCollaborator(true);
    fetch(
      `${baseUrl}/repos/${process.env.REACT_APP_ORG}/${name}/collaborators`,
      requestOptions
    )
      .then((res) => res.json())
      .then((result) => {
        const temp = result.map((item, index) => {
          return {
            key: index,
            name: item.login,
          };
        });
        setRepoCollaborator(temp);
      })
      .finally(() => setLoadingCollaborator(false));
    setOpenModal(true);
  };

  // MEMBERS OF TEAM
  const memberFetch = (count) => {
    setMemLoading(true);
    fetch(
      `${baseUrl}/teams/${selected}/members?per_page=${count}`,
      requestOptions
    )
      .then((res) => res.json())
      .then((actualData) => setMembers(actualData))
      .finally(() => setMemLoading(false));
  };

  // MEMBERSHIP OF MEMBERS
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

  const teamChange = (event) => {
    setSelected(event);
  };

  return (
    <>
      <BodyLayout>
        <Card>
          <FlexLayout halign="fill" valign="center">
            <FlexChild>
              <PageHeader title="Teams:"></PageHeader>
            </FlexChild>
            <FlexChild>
              <Select
                labelInLine
                name="Per Page Rows"
                onChange={(val) => {
                  repoFetch(val);
                  memberFetch(val);
                  setCountRepo(val);
                  setCountMember(val);
                  setPerPageData(val);
                }}
                value={perPageData}
                options={[
                  {
                    label: "5",
                    value: 5,
                  },
                  {
                    label: "10",
                    value: 10,
                  },
                  {
                    label: "25",
                    value: 25,
                  },
                  {
                    label: "50",
                    value: 50,
                  },
                ]}
                placeholder="Select"
                popoverContainer="body"
                thickness="thick"
              />
            </FlexChild>
          </FlexLayout>

          <Tabs
            alignment="horizontal"
            animate="type1"
            onChange={(event) => teamChange(event)}
            selected={selected}
            value={team.map((item) => {
              return {
                key: item.id,
                id: item.id,
                content: item.name + "( " + teamType + " )",
              };
            })}
          >
            <Card>
              <Card cardType="Bordered" title="Team Repositories:">
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
                      dataIndex: "repo_url",
                      key: "repo_url",
                      title: "Repo URL",
                      width: 200,
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
                    {
                      align: "center",
                      dataIndex: "collaborators",
                      key: "collaborators",
                      title: "Collaborators",
                      width: 100,
                    },
                  ]}
                  dataSource={
                    repo.length
                      ? repo.map((item) => {
                          return {
                            key: item.id,
                            id: item.id,
                            name: item.name,
                            repo_url: (
                              <a href={item.html_url} target="_blank">
                                {item.html_url}
                              </a>
                            ),
                            role_name: item.role_name,
                            visibility: item.visibility,
                            collaborators: (
                              <Button
                                type="TextButton"
                                content="list"
                                icon={<List />}
                                length="fullBtn"
                                onClick={() => viewCollaborator(item.name)}
                              ></Button>
                            ),
                          };
                        })
                      : []
                  }
                />
                {repo.length < totalRepoLength ? (
                  <div className="mt-20">
                    <FlexLayout halign="center">
                      <Button
                        type="Outlined"
                        onClick={() => {
                          repoFetch(countRepo + 5);
                          setCountRepo(countRepo + 5);
                        }}
                        content="Show More"
                        icon={<PlusCircle color="#5C5F62" />}
                      ></Button>
                    </FlexLayout>
                  </div>
                ) : null}
              </Card>
              <Card cardType="Bordered" title="Team Members:">
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
                      dataIndex: "github_url",
                      key: "github_url",
                      title: "Member Profile URL",
                      width: 200,
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
                            github_url: (
                              <a target="_blank" href={item.html_url}>
                                {item.html_url}
                              </a>
                            ),
                            role: item.role ?? (
                              <Button type="TextButton" content="Loading...">
                                {viewMembership(item.login)}
                              </Button>
                            ),
                          };
                        })
                      : []
                  }
                />
                {members.length < totalMemberLength ? (
                  <div className="mt-20">
                    <FlexLayout halign="center">
                      <Button
                        type="Outlined"
                        onClick={() => {
                          memberFetch(countMember + 5);
                          setCountMember(countMember + 5);
                        }}
                        content="Show More"
                        icon={<PlusCircle color="#5C5F62" />}
                      ></Button>
                    </FlexLayout>
                  </div>
                ) : null}
              </Card>
            </Card>
          </Tabs>
        </Card>
        <Modal
          open={openModal}
          close={() => setOpenModal(false)}
          heading={`Collaborators( ${selectedRepo} )`}
          modalSize="small"
          secondaryAction={{
            content: "Close",
            onClick: () => setOpenModal(false),
          }}
        >
          {loadingCollaborator ? (
            <Card>
              <Skeleton
                height="50px"
                line={3}
                rounded="50%"
                type="line"
                width="50px"
              />
            </Card>
          ) : (
            <Grid
              showHeader={false}
              columns={[
                {
                  align: "center",
                  dataIndex: "name",
                  key: "name",
                  title: "Name",
                  width: 100,
                },
              ]}
              dataSource={repoCollaborator}
            />
          )}
        </Modal>
      </BodyLayout>
    </>
  );
};

export default Main;
