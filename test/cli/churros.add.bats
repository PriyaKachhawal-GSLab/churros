#!/usr/bin/env bats

@test "It should support churros help add" {
  run churros help add
  [ "$status" -eq 0 ]
}

@test "It should handle churros add [INVALID_SUITE_TYPE]" {
  run churros add bobTheBuilder
  [ "$status" -eq 1 ]
}
