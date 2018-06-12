#!/usr/bin/env bats

USAGE="  Usage: churros-add [options] [command]"

@test "It should support churros help add" {
  run churros help add
  [ "$status" -eq 0 ]
  [ "${lines[1]}" = "${USAGE}" ]
}

@test "It should handle churros add [INVALID_SUITE_TYPE]" {
  run churros add bobTheBuilder
  [ "$status" -eq 1 ]
}
